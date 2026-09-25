import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://foeahubnrbclbelsqikp.supabase.co'
const supabaseKey = 'sb_publishable_MnURfwn0NCO-70pR4pF4Vw_Sl4r3CLA'

const supabase = createClient(supabaseUrl, supabaseKey)

const [,, email, password] = process.argv

if (!email || !password) {
  console.log('Usage: node scripts/test-login.mjs <email> <password>')
  process.exit(1)
}

;(async () => {
  try {
    console.log('Attempting signInWithPassword for', email)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Supabase error:', error)
      if (error.status) console.error('Status:', error.status)
      if (error.details) console.error('Details:', error.details)
      process.exit(2)
    }
    console.log('Sign-in successful. User:')
    console.log(JSON.stringify(data, null, 2))
    process.exit(0)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(3)
  }
})()
