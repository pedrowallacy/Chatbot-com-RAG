<script setup>
import { ref } from 'vue'

const pergunta = ref('')
const resposta = ref('')

const enviarPergunta = async () => {
  const res = await fetch('http://localhost:5000/chat/suporte', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ pergunta: pergunta.value }),
    credentials: 'include'
  })

  const data = await res.json()
  resposta.value = data.resposta
}
</script>

<template>
  <div>
    <input v-model="pergunta" placeholder="Digite sua pergunta" />
    <button @click="enviarPergunta">Enviar</button>
    <p>Resposta: {{ resposta }}</p>
  </div>
</template>
