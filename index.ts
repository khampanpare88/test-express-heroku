import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'

const app = express()
app.use(bodyParser.json())

interface Person{
  name: string;
  age: number;
}

interface DbSchema {
  users: User[]
}

interface User {
  id: number
  username: string
  password: string
}


interface DB{
  users: Array<User>
}

// init database file
const initialDb: DB = {
  users: []
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


type RegisterArgs = Omit<User, 'id'>

app.post<any, any, RegisterArgs>('/register', 
  body('username').isString(),
  body('password').isString(),
  (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(400)
      res.json(errors)
      return
    }

    const db = readDbFile()
    const hashPassword = bcrypt.hashSync(req.body.password, 10)
    db.users.push({
      id: Date.now(),
      username: req.body.username,
      password: hashPassword,
    })
    fs.writeFileSync('db.json', JSON.stringify(db))
    res.json({ message: 'Register complete' })
  })

type LoginArgs = Pick<User, 'username' | 'password'>

app.post<any, any, LoginArgs>('/login', (req, res) => {
  const body = req.body
  const db = readDbFile()
  const user = db.users.find(user => user.username === body.username)
  if (!user) {
    res.status(400)
    res.json({ message: 'Invalid username or password' })
    return
  }
  if (!bcrypt.compareSync(body.password, user.password)) {
    res.status(400)
    res.json({ message: 'Invalid username or password' })
    return
  }
  const token = jwt.sign(
    { id: user.id, username: user.username } as JWTPayload, 
    SECRET_KEY
  )
  res.json({ token })
})

app.listen(port, () => {
  console.log(`  App is running at port ${port}`)
  console.log("  Press CTRL-C to stop\n");
})