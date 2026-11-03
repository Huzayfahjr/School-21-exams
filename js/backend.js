/* Thin wrapper over supabase-js. If the library or the config is missing, the site keeps working without it. */
(function () {
  'use strict';
  var client = null;
  window.Backend = {
    init: function (site) {
      try {
        var s = site && site.supabase;
        if (!s || !s.url || !s.anonKey || !window.supabase || !window.supabase.createClient) return false;
        client = window.supabase.createClient(s.url, s.anonKey, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } });
        return true;
      } catch (e) { client = null; return false; }
    },
    enabled: function () { return !!client; },
    client: function () { return client; },
    session: function () { return client.auth.getSession().then(function (r) { return r.data && r.data.session; }); },
    onAuth: function (cb) { client.auth.onAuthStateChange(function (ev, s) { cb(s); }); },
    signIn: function (provider) { return client.auth.signInWithOAuth({ provider: provider, options: { redirectTo: location.origin + location.pathname } }); },
    signOut: function () { return client.auth.signOut(); },
    submit: function (exam, payload, author) { return client.from('submissions').insert({ exam: exam, payload: payload, author: author || null }); },
    approved: function (exam) { return client.from('questions').select('id,data').eq('exam', exam).order('created_at'); }
  };
})();
