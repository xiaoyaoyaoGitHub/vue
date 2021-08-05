module.exports = {
    devServer: {
        proxy: {
            '^/api': {
                target: "https://imissu.herokuapp.com",
                ws: true,
                changeOrigin: true
            }
        }
    }
}