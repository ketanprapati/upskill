

async function ConnectDB(client:any , dbName:string = '', collectionName:string = '') {
  try {
    await client.connect()
    console.log('Connected successfully to server')
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    console.log('collection find ')
    return collection
  } catch (e) {
    console.log('DB connection error', e)
    throw e
  }
}

export default ConnectDB