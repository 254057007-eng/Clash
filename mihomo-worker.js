// Mihomo 通用配置 Worker
// 用法：GET /mihomo?sub=<订阅URL> → 返回完整 Mihomo YAML
// 无 sub 参数时返回模板原文（用户自行替换占位符）

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const sub = url.searchParams.get('sub');

    // 模板来源：GitHub raw，通过环境变量可覆盖
    const templateUrl = env.TEMPLATE_URL ||
      'https://raw.githubusercontent.com/254057007-eng/Clash/main/mihomo-template.yaml';

    let template;
    try {
      template = await (await fetch(templateUrl)).text();
    } catch (e) {
      return new Response('Template fetch failed: ' + e.message, { status: 502 });
    }

    // 无订阅参数 → 返回模板原文，供手动替换
    if (!sub) {
      return new Response(template, {
        headers: {
          'Content-Type': 'text/yaml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // 有订阅参数 → 验证订阅可访问性（可选，快速失败）
    try {
      const check = await fetch(sub, {
        method: 'HEAD',
        headers: { 'User-Agent': 'clash.meta/1.19.0' },
        redirect: 'follow'
      });
      if (!check.ok && check.status >= 400) {
        return new Response(
          `Subscription unreachable: HTTP ${check.status}\nURL: ${sub}`,
          { status: 502 }
        );
      }
    } catch (e) {
      return new Response(
        `Subscription unreachable: ${e.message}\nURL: ${sub}`,
        { status: 502 }
      );
    }

    // 注入订阅地址到 proxy-providers
    const config = template.replace(
      /url:\s*'PASTE_YOUR_SUBSCRIPTION_URL_HERE'/,
      `url: '${sub}'`
    );

    return new Response(config, {
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
