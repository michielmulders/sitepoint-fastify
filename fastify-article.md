# How to Create Your First REST API With Fastify

[Fastify](fastify.io) is a framework designed for backend web development. It offers a more lightweight alternative to heavier Node.js API frameworks such as Hapi and Express. From July 2020, Fastify has released its third version of the framework. This third version comes with improved validation abilities to verify incoming and outgoing requests, as request parameters. Moreover, the third version of the framework consolidates its throughput claims of being the fastest Node.js framework compared with Koa, Resitfy, Hapi, and Express. More information can be found on the [benchmarks page](https://www.fastify.io/benchmarks/).

Fastify has gained a lot of popularity due to its lightweight design, however, a lot of attention goes to its [plugin ecosystem](https://www.fastify.io/ecosystem/). Fastify has adopted the idea that everything is a plugin whereas, with JavaScript, everything is an object. This allows you to quickly encapsulate functionality for your project as a plugin and distribute it so other projects can use your code. 

Let's get started with this tutorial. You'll learn the following aspects of Fastify:

- How to set up your first Fastify API
- How to define Fastify API routes
- How to add schema validation to requests
- How to load and use Fastify plugins
- How to define Fastify hooks

# Requirements and Installation

To follow this tutorial, you'll need:

1. Latest Node.js version
2. Tool for sending requests, such as [cURL](https://curl.haxx.se/) or [Postman](https://www.postman.com/)

Next, make sure to create an empty Node.js project. If you don't have one yet, you can use the following command to set up your project:

```bash
npm init -y
```

Lastly, we want to add this Fastify dependency to our project.

```bash
npm i fastify --save
```

All good? Let's create our basic API setup in the next step.

# Step 1: Basic API Setup

First, let's create our basic API setup. To get started, we need to create a new file called `index.js` within our project root.

```bash
touch index.js
```

Next, let's add the basic server setup. Copy the below code.

```js
// Require the framework and instantiate it
const app = require('fastify')({
    logger: true
})

// Declare a route
app.get('/', function (req, reply) {
    reply.send({ hello: 'world' })
})

// Run the server!
app.listen(3000, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    app.log.info(`server listening on ${address}`)
})
```

There are a couple of things happening here. We first load the Fastify application object and enable logging. Next, we declare a root route that replies with a JSON reponse. The last part of the code snippet shows that we are listening on port 3000 for the application to receive requests. 

Let's validate if your basic server setup works. First, we need to start the server by running the `index.js` file:

```bash
node index.js
```

Thereafter, navigate to `http://localhost:3000` in your browser. You should see the following response.

```json
{
    "hello": "world"
}
```

Success? Let's go to step 2 to define different CRUD routes.

# Step 2: Define CRUD Routes

An API is useless with only GET routes. Let's define more routes for handling blogs. Therefore, let's create the following routes:

- GET all blogs at /api/blogs
- GET one blog at /api/blogs/:id
- POST add blog at /api/blogs
- PUT update blog at /api/blogs/:id
- DELETE delete blog at /api/blogs/:id

The first thing to do is creating a blog controller.

## Step 2.1: Create Blogs Controller

To keep our code clean, let's define a `controller` folder in the project root. Here, we create a file called `blogs.js`.

This file contains some demo data to avoid complicating this tutorial with a database integration. Therefore, we use an array containing blog objects which each contain an ID and title field. 

Moreover, we define the different handlers for all the above routes in this file. A handler always accepts a `req` (request) and `reply` parameter. The request parameter is useful to access request parameters or request body data.

Add the following code to your `/controller/blogs.js` file.

```js
// Demo data
let blogs = [
    {
        id: 1,
        title: 'This is an experiment'
    },
    {
        id: 2,
        title: 'Fastify is pretty cool'
    },
    {
        id: 3,
        title: 'Just another blog, yea!'
    }
]

// Handlers
const getAllBlogs = async (req, reply) => {
    return blogs
}

const getBlog = async (req, reply) => {
    const id = Number(req.params.id) // blog ID
    const blog = blogs.find(blog => blog.id === id)
    return blog
}

const addBlog = async (req, reply) => {
    const id = blogs.length + 1 // generate new ID
    const newBlog = {
        id,
        title: req.body.title
    }

    blogs.push(newBlog)
    return newBlog
}

const updateBlog = async (req, reply) => {
    const id = Number(req.params.id)
    blogs = blogs.map(blog => {
        if (blog.id === id) {
            return {
                id,
                title: req.body.title
            }
        }
    })

    return {
        id,
        title: req.body.title
    }
}

const deleteBlog = async (req, reply) => {
    const id = Number(req.params.id)

    blogs = blogs.filter(blog => blog.id !== id)
    return { msg: `Blog with ID ${id} is deleted` }
}

module.exports = {
    getAllBlogs,
    getBlog,
    addBlog,
    updateBlog,
    deleteBlog
}
```

Note how we can access the request parameter for routes such as `/api/blogs/:id` via `req.params.id`. For POST and PUT routes, we can access the body of the request via `req.body`. 

In step 2.2, we'll connect the route handlers to the route objects. 

## Step 2.2: Define Blog Routes and Couple Blogs Controller

Again, to keep our code clean, let's define a `routes` folder in the project root. Here, we create a file called `blogs.js`. This file holds the routes object for our blog routes.

```bash
mkdir routes
cd routes
touch blogs.js
```

Luckily, Fastify allows us to define an array containing route objects. Here, we can couple the handlers we have defined previously to the different routes. Don't forget to require the blogs controller. Let's take a look.

```js
const blogController = require('../controller/blogs');

const routes = [{
        method: 'GET',
        url: '/api/blogs',
        handler: blogController.getAllBlogs
    },
    {
        method: 'GET',
        url: '/api/blogs/:id',
        handler: blogController.getBlog
    },
    {
        method: 'POST',
        url: '/api/blogs',
        handler: blogController.addBlog
    },
    {
        method: 'PUT',
        url: '/api/blogs/:id',
        handler: blogController.updateBlog
    },
    {
        method: 'DELETE',
        url: '/api/blogs/:id',
        handler: blogController.deleteBlog
    }
]
module.exports = routes
```

Now, we have defined all routes. However, Fastify doesn't know about these routes. The next step shows how you can register routes with your Fastify application object.

## Step 2.3: Register Fastify Routes

In this step, we'll register Fastify routes to the app object. First, we load all the blog routes. Next, we loop over all the routes to register them one by one.

```js
// Require the framework and instantiate it
const app = require('fastify')({
    logger: true
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

// Run the server!
app.listen(3000, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    app.log.info(`server listening on ${address}`)
})
```

Done? It's time to validate if the blog routes work. Spin up the server using `node index.js` and visit `http://localhost:3000/blogs/1` to get the first blog from the demo data. You should see the following result.

```js
{
    "id": 1,
    "title": "This is an experiment"
}
```

All good? Let's learn in step 3 how to add schema validation to requests and responses.

# Step 3: Adding Schema Validation

This step teaches you how to add schema validation to your project. We can make use of the `schema` key in our `routes` definition to pass a validation schema to a particular route.

Let's start with defining a schema for the route `/api/blogs/:id` to validate the request parameter and response. Requirements?

1. `:id` parameter must be of type string
2. response must contain an object with two properties `id` (integer) and `title` (string)

Add the following validation object to your `routes/blogs.js` file.

```js
const getBlogValidation = {
        params: {
            id: { type: 'string' }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' }
                }
            }
        }
}
```

To connect the validation object to our route, we have to define the schema key. Look for the `/api/blogs/:id` route in the `routes` array and change the object accordingly:

```js
...
{
    method: 'GET',
    url: '/api/blogs/:id',
    schema: getBlogValidation, // add validation
    handler: blogController.getBlog
},
...
```

Let's do the same for adding a blog `POST /api/blogs`. Here, we want to verify if the `req.body` object contains a `title` parameter. Let's take a look: 

```js
const addBlogValidation = {
    body: {
        type: 'object',
        required: [
            'title'
        ],
        properties: {
            title: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                title: { type: 'string' }
            }
        }
    }
}
```

Next, we have to connect the validation object again to the correct route.

```js
...
{
    method: 'POST',
    url: '/api/blogs',
    schema: addBlogValidation, // add validation
    handler: blogController.addBlog
},
...
```

To verify our validation, let's retrieve the blog with ID 3. Open your browser at `http://localhost:3000/api/blogs/3`. You should see the following response:

```json
{
    "id": 3,
    "title": "Just another blog, yea!"
}
```

Now, let's make a mistake and change the `params` validation for the `id` field from `sting` to `object` like so:

```js
const getBlogValidation = {
        params: {
            id: { type: 'object' } // Try changing to object to see error
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' }
                }
            }
        }
}
```

When requesting the same resource from your API, you'll receive the following error message.

```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "params.id should be object"
}
```

Do you see the error? Good! Let's revert the change to `string` to avoid future errors and move to the next step.

# Step 4: Load Fastify Plugins

Here, let's make use of Fastify's rich [plugin ecosystem](https://www.fastify.io/ecosystem/). You can find plugins that help you with various tasks, such as database integrations or authorization setups. Why would you spend time writing authorization from scratch while you can make use of Fastify plugins? Often, you want to look for packages outside of Fastify's ecosystem that help you with certain problems or tasks. However, by providing a rich plugin ecosytem, Fastify becomes a one-stop solution that definitely improves the developer experience!

**A quick note about plugins:** You can create your own plugins to encapsulate functionality. Moreover, you can load those plugins to your Fastify application object. By default, Fastify will [first load plugins from the Fastify ecosystem](https://www.fastify.io/docs/latest/Getting-Started/#loading-order-of-your-plugins). Afterward, custom plugins are loaded.

Ok, let's get practical! I would like to use the [fastify-env](https://github.com/fastify/fastify-env) plugin which helps you with loading environment variables and setting defaults for each variable. Therefore, let's add this dependency to our project.

```bash
npm install --save fastify-env
```

Next, we can load the dependency after loading the Fastify application object in the `index.js` file. Your `index.js` file looks like this:

```js
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

// Declare a route
app.get('/', function (req, reply) {
    reply.send({ hello: 'world' })
})

// Register routes to handle blog posts
const blogRoutes = require('./routes/blogs')
blogRoutes.forEach((route, index) => {
    app.route(route)
})

// Run the server!
app.listen(app.config.PORT, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    app.log.info(`server listening on ${address}`)
})
```

Note that we have to define an `options` object that tells the fastify-env plugin what env variables to look for and which defaults to set. Here, I want to load a `PORT` variable with a default value of `1000`.

By default, the fastify-env plugin will make all environment variables available via the Fastify app object like so: `app.config.PORT`. Why? The fastify-env plugin attaches the loaded configurations to the `confKey` which by default is set to `config`. However, if you wish, you can change this to another key.

Start the project with `node index.js` and monitor the output. You should see the `PORT` variable being print in your terminal. 

Other interesting plugins to use?

1. [fastify-auth](https://github.com/fastify/fastify-auth): Run multiple auth functions in Fastify
2. [fastify-bearer-auth](https://github.com/fastify/fastify-bearer-auth): Bearer auth plugin for Fastify.
3. [fastify-caching](https://github.com/fastify/fastify-caching): General server-side cache and etag support.
4. [fastify-cors](https://github.com/fastify/fastify-cors): Enables the use of CORS in a Fastify application.

# Step 5: Define Hooks

Lastly, let's define some hooks. From the [Fastify hooks documentation](https://www.fastify.io/docs/v3.2.x/Hooks/), we can read the following. "Hooks are registered with the fastify.addHook method and allow you to listen to specific events in the application or request/response lifecycle. You have to register a hook before the event is triggered, otherwise the event is lost."

Make sure to define hooks before you define any routes.

```js
// hooks
app.addHook('onRoute', (routeOptions) => {
    console.log(`Registered route: ${routeOptions.url}`)
})

// Declare a route
app.get('/', function (req, reply) {
    reply.send({ hello: 'world' })
})
```

As you can see, the addHook function first accepts the hook you want to listen for. In our example, we want to listen for new routes being registered with the application. Next, the callback function accepts a `routeOptions` argument which contains a lot of information, such as the route URL or route method. 

Specific details for the [`onRoute` hook](https://www.fastify.io/docs/v3.2.x/Hooks/#onroute) can be found in the documentation.

Let's start the API with `node index.js` to see which routes have been registered. Your terminal output should look like this:

```bash
Registered route: /
Registered route: /api/blogs
Registered route: /api/blogs/:id
Registered route: /api/blogs
Registered route: /api/blogs/:id
Registered route: /api/blogs/:id
```

Got the same output? Success! At the same time, this was the end of the Fastify tutorial. Let's wrap up this project with a short conclusion.

# Wrapping Up

Fastify is a great light-weight project that allows you to make use of its rich plugin ecosystem. Instead of creating functionality from scratch, you can make use of existing plugins. In other words, Fastify acts as a one-stop shop for developers, definitely improving the developer experience.

Personally, I like the Fastify hooks functionality as you can listen for various lifecycle events within your application. 

Want to learn more about Fastify, check out the following documentation pages:

- [How to create a custom plugin?](https://www.fastify.io/docs/master/Plugins/#create-a-plugin)
- [How to add Typescript support?](https://www.fastify.io/docs/master/TypeScript/)
- [How to use middleware such as CORS?](https://www.fastify.io/docs/master/Middleware/)
