const { createApp } = require('./src/app')
const supabase = require('./src/supabase')

const app = createApp()
const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log(`Server running and connected to Supabase, on port ${port}`)
})