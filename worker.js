export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 处理 CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 静态页面
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return fetch('https://raw.githubusercontent.com/keenturbo/chatgpt-team-invite/main/index.html');
    }

    // 邀请 API
    if (url.pathname === '/api/invite' && request.method === 'POST') {
      return handleInvite(request, env);
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleInvite(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { email } = await request.json();

    // 验证邮箱格式
    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: '请输入有效的邮箱地址' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 从环境变量获取配置
    const ACCOUNT_ID = env.CHATGPT_ACCOUNT_ID;
    const TOKEN = env.CHATGPT_TOKEN;

    if (!ACCOUNT_ID || !TOKEN) {
      return new Response(
        JSON.stringify({ error: '服务配置错误' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 调用 ChatGPT API 发送邀请
    const apiUrl = `https://chatgpt.com/backend-api/accounts/${ACCOUNT_ID}/invites`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'Referer': 'https://chatgpt.com/admin/members',
        'Authorization': `Bearer ${TOKEN}`,
        'ChatGPT-Account-Id': ACCOUNT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_addresses: [email],
        role: 'standard-user',
        resend_emails: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return new Response(
        JSON.stringify({ success: true, message: '邀请已发送', data }),
        { status: 200, headers: corsHeaders }
      );
    } else {
      const errorText = await response.text();
      console.error('ChatGPT API Error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: '邀请发送失败，请稍后重试' }),
        { status: response.status, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: '服务器错误' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}