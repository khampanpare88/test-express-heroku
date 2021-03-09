import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'

const app = express()
app.use(bodyParser.json())

interface Person{
  name: string;
  age: number;
}

interface DB{
  persons: Array<Person>
}

// init database file
const initialDb: DB = {
  persons: []
}
fs.writeFileSync('db.json', JSON.stringify(initialDb))

const readDbFile = () : DB => {
  const raw = fs.readFileSync('db.json', 'utf8')
  const db: DB = JSON.parse(raw)
  return db
}

app.get('/person', (req,res) => {
  res.status(200)
  res.json(readDbFile())
})

app.post('/person', (req, res) => {
  const {name, age} = req.body as Person
  const db = readDbFile()
  db.persons.push({name, age})

  fs.writeFileSync('db.json', JSON.stringify(db))

  res.status(200)
  res.json({message:'Add new person successfully'})
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`  App is running at port ${port}`)
  console.log("  Press CTRL-C to stop\n");
})