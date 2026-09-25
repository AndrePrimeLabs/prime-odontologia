import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://foeahubnrbclbelsqikp.supabase.co'
const supabaseKey = 'sb_publishable_MnURfwn0NCO-70pR4pF4Vw_Sl4r3CLA'

const supabase = createClient(supabaseUrl, supabaseKey)

const [,, email] = process.argv

if (!email) {
  console.log('Usage: node scripts/send-reset.mjs <email>')
  process.exit(1)
}

;(async () => {
  try {
    console.log('Requesting password reset for', email)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://primeos.primeodontologia.com.br/login.html'
    })
    if (error) {
      console.error('Supabase reset error:', error)
      if (error.status) console.error('Status:', error.status)
      if (error.details) console.error('Details:', error.details)
      process.exit(2)
    }
    console.log('Reset request sent. Data:', JSON.stringify(data || {}, null, 2))
    process.exit(0)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(3)
  }
})()
