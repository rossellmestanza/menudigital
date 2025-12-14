import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
    throw new Error('Por favor define la variable MONGODB_URI en .env.local')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
    // En desarrollo, usa una variable global para preservar el valor a través de hot-reloads
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options)
        global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
} else {
    // En producción, es mejor no usar una variable global
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
}

export default clientPromise
