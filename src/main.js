import './style.css'
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const supabase = url && key ? createClient(url, key) : null

const form = document.querySelector('#contactForm')
const status = document.querySelector('#formStatus')

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  if (!supabase) {
    status.textContent = 'Chưa cấu hình Supabase. Hãy tạo file .env từ .env.example.'
    status.className = 'error'
    return
  }

  const name = document.querySelector('#name').value.trim()
  const email = document.querySelector('#email').value.trim()
  const message = document.querySelector('#message').value.trim()

  status.textContent = 'Đang gửi...'
  status.className = ''

  const { error } = await supabase
    .from('contacts')
    .insert([{ name, email, message }])

  if (error) {
    console.error(error)
    status.textContent = 'Gửi thất bại. Kiểm tra bảng contacts và RLS trên Supabase.'
    status.className = 'error'
    return
  }

  status.textContent = 'Gửi thành công! Cảm ơn bạn đã liên hệ.'
  status.className = 'success'
  form.reset()
})