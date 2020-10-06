// Require the framework and instantiate it
const app = require('fastify')({
    logger: true
})

// Use Fastify Env plugin: https://github.com/fastify/fastify-env
const fastifyEnv = require('fastify-env') // load plugin

const options = {
    confKey: 'config', // optional, default: 'config'
    schema: {
        type: 'object',
        required: ['PORT'],
        properties: {
            PORT: {
                type: 'string',
                default: 1000
            }
        }
    }
}

app
    .register(fastifyEnv, options)
    .ready((err) => {
        if (err) console.error(err)

        console.log(app.config)
        // output: { PORT: 1000 }
    })

// hooks
app.addHook('onRoute', (routeOptions) => {
    console.log(`Registered route: ${routeOptions.url}`)
})

// Declare a route
app.get('/', function (req, reply) {
    reply.send({ hello: 'world' })
})

// Register routes to handle blog posts
const blogRoutes = require('./routes/blogs')
blogRoutes.forEach((route, index) => {
    app.route(route)
})

// Multiple parameters within same couple of slash "/"
// e.g. /example/100-500 -> prints 100 and 500
app.get('/example/:lat-:lon', (req, reply) => {
    console.log(req.params.lat)
    console.log(req.params.lon)

    return { msg: 'success' }
})

// Run the server!
app.listen(3000, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    app.log.info(`server listening on ${address}`)
})