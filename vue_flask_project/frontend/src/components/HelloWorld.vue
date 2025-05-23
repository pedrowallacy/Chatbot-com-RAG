<template>
  <div class="chat-container">
    <div class="chat-history" ref="chatHistory">
      <div
        v-for="(msg, index) in historico"
        :key="index"
        :class="['chat-message', msg.role]"
      >
        <p class="chat-author">{{ msg.role === 'user' ? 'Você' : 'Assistente' }}</p>
        <div class="chat-bubble">{{ msg.content }}</div>
      </div>
    </div>
    <div class="input-container">
      <div class="input-inner">
        <input v-model="pergunta" placeholder="Digite sua pergunta" @keyup.enter="enviarPergunta" />
        <button @click="enviarPergunta">Enviar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const pergunta = ref('')
const resposta = ref('')
const historico = ref([])
const chatHistory = ref(null)

const enviarPergunta = async () => {
  if (!pergunta.value.trim()) return
  historico.value.push({ role: 'user', content: pergunta.value })

  await nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  })

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

  await nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  })
}
</script>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  height: 100%;
  background: #343541;
  font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
  color: #1a1a82;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

.chat-container {
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;      
  background: url("/backgroud_login.png") no-repeat center center;
  background-size: cover;
}

.chat-history {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  padding: 40px 0 24px;
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 99%; 
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #2e3b8f #343541;
  min-height: 0;
}

.chat-history::-webkit-scrollbar {
  width: 8px;
}
.chat-history::-webkit-scrollbar-thumb {
  background: #444654;
  border-radius: 8px;
}

.chat-message {
  /*width: 100%;*/
  display: flex;
  flex-direction: column;
  align-self: center;
  max-width: 60%;
  margin-top: 18px;
  /*margin-bottom: 0;*/
}

.chat-message.user {
 /*ign-self: center;
  align-items: center;*/
  margin-right: 0;
  margin-left: auto;
}

.chat-message.assistant {
 /*lign-self: center;
  align-items: center;*/
  margin-left: 0;
  margin-right: auto;
}

.chat-author {
  font-size: 0.85em;
  color: #8e8ea0;
  margin-bottom: 2px;
  margin-left: 6px;
}

.chat-bubble {
  background: #3948a9;
  color: #ececf1;
  border-radius: 12px;
  padding: 18px 24px;
  word-break: break-word;
  font-size: 1.08em;
  line-height: 1.7;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}

.chat-message.assistant .chat-bubble {
  margin-right: 20px;
}

.chat-message.user .chat-bubble {
  margin-left: 20px;
  background: #2a2b32;
  color: #ececf1;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}

/*container de entrada*/
.input-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: linear-gradient(0deg, #343541 80%, rgba(52,53,65,0) 100%);
  box-shadow: 0 -2px 16px 0 rgba(0,0,0,0.10);
  z-index: 100;
  gap: 8px;
  margin-top: auto;
  border-top: 1px solid #444654;
}

/*entrada da pergunta*/
.input-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 820px;
  background: #1db02e;
  border-radius: 24px;
  padding: 16px 24px;
  box-shadow: 0 2px 16px 0 rgba(185, 12, 12, 0.18);
  gap: 10px;
  border: none;
}

/*entrada da pergunta*/
.input-inner input {
  flex: 1;
  background: transparent;
  border: none;
  color: #f4f4f4;
  font-size: 1.13em;
  outline: none;
  padding: 0 px;
  font-family: inherit;
}

/*input da pergunta*/
.input-inner input::placeholder {
  color: #ff0080;
  opacity: 0.8;
  font-size: 1.13em;
  font-family: inherit;
  font-weight: 400;
}

/*botão de enviar*/
.input-inner button {
  background: #1e2b7c;
  border: none;
  color: #ececf1;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  font-size: 1.3em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}

/*botão de enviar*/
.input-inner button:hover {
  background: #c7c8d1;
}
</style>