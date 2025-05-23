// libs/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cepmyqmmiyaqfwdxqtvc.supabase.co' // જેમ કે https://abcd.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcG15cW1taXlhcWZ3ZHhxdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTA2NTYsImV4cCI6MjA2Mjk4NjY1Nn0.SaW36cj_3gkHzQ83Z10M7LDQaxDkVnlkcyzhsw850e4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
