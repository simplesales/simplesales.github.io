console.log('ss widget loaded')

window.SimpleSalesWidget = {};
window.SimpleSalesWidget.baseUrl = 'https://clients.amoapi.ru'
window.SimpleSalesWidget.self = {};
window.SimpleSalesWidget.widgets = [];
window.SimpleSalesWidget.run = function(event) {
    console.log('run event', event)
    for (const widget of  window.SimpleSalesWidget.widgets) {
        if (widget[event] && typeof widget[event] === 'function') {
            widget[event](data);
        }
    }
    return true;
}

window.SimpleSalesWidget.auth = async () => {
    console.log('auth call')
    return new Promise((resolve, reject) => {
        window.SimpleSalesWidget.self.$authorizedAjax({
            url: `${window.SimpleSalesWidget.baseUrl}/ss_widget/auth?ss_subdomain=${AMOCRM.widgets.system.subdomain}`
          }).done(function (response) {
            window.SimpleSalesWidget.jwt = response.jwt
            console.log('success', response.jwt);
            resolve(response)
          }).fail(function (err) {
            console.log('error', err);
            reject(err)
          });
    })
}

window.SimpleSalesWidget.call = async (method, data) => {
    console.log('call', {method, data})
    return new Promise((resolve, reject) => {
        window.SimpleSalesWidget.self.$authorizedAjax({
            url: `${window.SimpleSalesWidget.baseUrl}/ss_widget/call`,
            method: "POST",
            data: { method, data, ss_subdomain: AMOCRM.widgets.system.subdomain},
          }).done(function (response) {
            console.log('call response', response);
            resolve(response)
          }).fail(function (err) {
            console.log('error', err);
            reject(err)
          });
    })
}

window.SimpleSalesWidget.socketConnect = (io) => {
    const socket = io(window.SimpleSalesWidget.baseUrl, {
        query: {
          token: window.SimpleSalesWidget.jwt,
          subdomain: AMOCRM.widgets.system.subdomain
        }
      })
      console.log('try to emit join')
      socket.emit('call', 'socketrooms.join', [AMOCRM.constant('user').id, AMOCRM.widgets.system.subdomain])
      console.log('after emit')
      socket.on('message', (data) => {
        console.log('socket message received', data);
        window.SimpleSalesWidget.run('socketIn', data)
      });
}
