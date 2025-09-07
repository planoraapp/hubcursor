// Script para gerar hash correto da senha
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'habbohub_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Gerar hash para a senha '151092'
hashPassword('151092').then(hash => {
  console.log('Hash da senha 151092:', hash)
})

// Gerar hash para a senha '290684'
hashPassword('290684').then(hash => {
  console.log('Hash da senha 290684:', hash)
})
