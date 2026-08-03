// Mihomo 通用配置 Worker — 模板内嵌版
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const sub = url.searchParams.get('sub');

    const template = `TEMPLATE_PLACEHOLDER`;

    if (!sub) {
      return new Response(template, {
        headers: { 'Content-Type': 'text/yaml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
      });
    }

    try {
      const check = await fetch(sub, {
        method: 'HEAD',
        headers: { 'User-Agent': 'clash.meta/1.19.0' },
        redirect: 'follow'
      });
      if (!check.ok && check.status >= 400) {
        return new Response(`Subscription unreachable: HTTP ${check.status}\nURL: ${sub}`, { status: 502 });
      }
    } catch (e) {
      return new Response(`Subscription unreachable: ${e.message}\nURL: ${sub}`, { status: 502 });
    }

    const config = template.replace(/url:\s*'PASTE_YOUR_SUBSCRIPTION_URL_HERE'/, `url: '${sub}'`);
    return new Response(config, {
      headers: { 'Content-Type': 'text/yaml; charset=utf-8', 'Cache-Control': 'no-cache' }
    });
  }
};
