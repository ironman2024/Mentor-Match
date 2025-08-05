# Deployment Environment Variables

Set these environment variables in your deployment platform:

## Required Variables:

```
MONGODB_URI=mongodb://atharvakarval2022comp:NXMO8DFyV5LuCyTf@ac-vqntsmq-shard-00-00.r9nhw2d.mongodb.net:27017,ac-vqntsmq-shard-00-01.r9nhw2d.mongodb.net:27017,ac-vqntsmq-shard-00-02.r9nhw2d.mongodb.net:27017/?replicaSet=atlas-34lqwf-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=campus_connect_b2c77d8e9a4f5c6b3a2e1d

PORT=5002

NODE_ENV=production
```

## For Railway:
1. Go to your Railway project dashboard
2. Click on "Variables" tab
3. Add each variable above

## For Render:
1. Go to your Render service dashboard
2. Click on "Environment" tab
3. Add each variable above

## For Vercel:
1. Go to your Vercel project dashboard
2. Click on "Settings" > "Environment Variables"
3. Add each variable above