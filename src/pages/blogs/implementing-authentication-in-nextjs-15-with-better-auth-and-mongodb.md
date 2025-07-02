---
layout: ../../layouts/BlogLayout.astro
title: "Implementing Authentication in NextJS 15 with better auth and MongoDB"
author: "Ayush Sharma"
date: "12 May, 2025"
---

![better-auth](https://efficacious-coral-e49.notion.site/image/attachment%3A31258efb-1f71-411a-b6a8-19c62505d2f1%3A1fffa32b-9794-4ec0-93e9-3e07401a3f03.png?table=block&id=19dd20fc-d7bf-809d-866e-ee2274a231a3&spaceId=5d38ac89-baee-4df2-a416-78c2148bfd79&width=1420&userId=&cache=v2)
Hey there, fellow developers! After spending countless hours wrestling with different auth solutions in Next.js, I finally found my go-to authentication library: [better-auth](https://www.better-auth.com/). In this blog, I'll walk you through implementing it in your Next.js application, sharing all the gotchas I discovered along the way.

## Why better-auth?
Before we dive in, you might be wondering why I chose better-auth over other options. Well, after trying various solutions, I found better-auth strikes the perfect balance between simplicity and flexibility. It's lightweight, well-documented, and most importantly, it just works without too much configuration headache.

## Getting Started
First things first, let's install the necessary packages. Fire up your terminal and run:
```bash
npm install better-auth 
# or if you're using yarn
yarn add better-auth
# or if you're using pnpm
pnpm add better-auth
```

## Setting environment variables
Create a *.env* file in the root of your project and add the following environment variables:
```bash
# use any random value here 
BETTER_AUTH_SECRET= 
# base url of your app
BETTER_AUTH_URL=http://localhost:3000
```

## Creating auth instance
Create a *auth.ts* file in */lib* or */utils* directory of your code and add the following code.
```javascript
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import db from "./db"; 

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
        autoSignIn: false
    },
    // You can add social logins like this
    // ------------------------------------------
    // socialProviders: {
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET
    //     }
    // }
    //-------------------------------------------
});
```

## Configuring MongoDB client
Since we’re using MongoDB in this implementation, I've explained only MongoDB configuration. If you're using prisma, drizzle or any other orm, check better-auth docs [here](https://www.better-auth.com/docs/concepts/database).

 Let’s start by installing MongoDB in our project. Fire up your terminal and run:

```bash
npm install mongodb
# or if you're using yarn
yarn add mongodb
# or if you're using pnpm
pnpm add mongodb
```

Initially, create the **MONGODB_URI** variable in your .env file
```bash
# this will work only if you're using a local database, but if you're using mongodb atlas
# copy URI srting from there and change it here
MONGODB_URI='mongodb://localhost:27017/users' 
```

Now create a *db.ts* file in either /lib or /utils directory of your code and add the following code.

```javascript
import { MongoClient } from "mongodb";
// Throw an error if uri is not fetched from .env
if (!process.env.MONGODB_URI) {
     throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}
// initializing mongodb client instance 
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db();

export default db;
```

## Create handler
To handle API requests, we need to create a catch-all route handler in our project

Create a `route.ts` file at `/app/api/auth/[...all]/route.ts`  in your project add the following code there.
```typescript
import { auth } from "@/lib/auth"; // path to your auth.ts file
import { toNextJsHandler } from "better-auth/next-js";
 
export const { POST, GET } = toNextJsHandler(auth);
```

Server-side logic is complete! 🎉
## Creating client instance 
Create a *auth-client.ts* file at /lib directory of your project and add the following code
```javascript
import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    baseURL: "http://localhost:3000" // the base url of your auth server
})
```

That’s it, now you’re ready to use authentication in your project, here’s a very basic implementation to start out 
![folder_structure](https://efficacious-coral-e49.notion.site/image/attachment%3A6eeb27c0-3a45-4ec9-a62f-5445417ed628%3Aimage.png?table=block&id=19dd20fc-d7bf-8008-a081-c09cee18aecc&spaceId=5d38ac89-baee-4df2-a416-78c2148bfd79&width=670&userId=&cache=v2)

I have created a (auth) route group like this for better clarity, you can implement this as you want. If you're following this tutorial, create sign-in route at `/app/(auth)/sign-in/page.tsx` and sign-up route at `/app/(auth)/sign-in/page.tsx` and a layout.tsx file inside `(auth)` directory

Add the following code in `layout.tsx` file
```javascript
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
	    // this will align everything to center
      <div className="h-full w-screen flex items-center justify-center">{children}</div>
    </main>
  );
}
```

Now add this code in your sign-in route at /app/(auth)/sign-in/page.tsx

```javascript
'use client'
import { authClient } from '@/lib/auth-client';
import React from 'react'
import { useState } from 'react'

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        const {data, error} = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard" 
        })
        setLoading(false);
    }
  return (
    <div>
      <h1>Sign In</h1>
      <input type="text" onChange={(e) => setEmail(e.target.value)} placeholder='email' />
      <input type="text" onChange={(e) => setPassword(e.target.value)} name="" id="password" />
      <button onClick={handleClick}>{loading ? "Loading..." : "Sign In"}</button>
    </div>
  )
}

export default SignIn
```

And for the sign up route 
```javascript
"use client"
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleClick = async () => {
    setLoading(true);
    const {data, error} = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/dashboard"
    }, {
      onRequest: () => {
        setLoading(true);
      },
      onSuccess: () => {
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      }
    })
  }
  return (
   <main>
      <input type="text" placeholder="name" onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleClick}>{loading ? "Loading..." : "Sign Up"}</button>
   </main>
  );
}
```

I have created a dashboard route to redirect the user after signing-in, it has the following code, you can create any route you want to redirect your user to

```javascript
import React from 'react'

const Dashboard = () => {
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard
```

This the basic implementation of auth using better-auth in NextJS, all of this code is in this [repo](https://github.com/ayushsharma74/better-auth-template) for more complex use cases, check better auth docs [here](https://www.better-auth.com/docs/introduction)

Thanks for reading, have a good day :)