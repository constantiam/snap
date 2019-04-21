// vue.config.js
module.exports = {
    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    'primary-color': '#7E496E',
                    'link-color': '#7E496E',
                    'border-radius-base': '2px',
                    'site-heading-color': '#7E496E',
                },
                javascriptEnabled: true
            }
        }
    }
}