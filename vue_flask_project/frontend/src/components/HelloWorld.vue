<script setup>
import { ref } from 'vue'

const pergunta = ref('')
const resposta = ref('')
const historico = ref([])

const enviarPergunta = async () => {
    historico.value.push({ role: 'user', content: pergunta.value })

  const res = await fetch('http://localhost:5000/chat/suporte', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ pergunta: pergunta.value }),
    credentials: 'include'
  })

const data = await res.json()
historico.value.push({ role: 'assistant', content: data.resposta })

pergunta.value = ''
}
</script>

<template>
  <div>
    <input v-model="pergunta" placeholder="Digite sua pergunta" />
    <button @click="enviarPergunta">Enviar</button>

    <div v-for="(msg, index) in historico" :key="index">
      <p><strong>{{ msg.role === 'user' ? 'Você' : 'Assistente' }}:</strong> {{ msg.content }}</p>
    </div>
  </div>
</template>
