<template lang="html">
  <div>
    <design-het class="widget" installation="true" circles="3"></design-het>
  </div>
</template>

<script>
import io from 'socket.io-client'
import {server} from './../config.js'

export default {
  data() {
    return {
      socket : io(server),
      widget: null,
      vals: null
    }
  },
  mounted() {
    this.widget = document.querySelector(".widget")

    // ask config from server
    this.socket.emit('GET_VALUES')

    this.socket.on('INIT_VALUES', (data) => {
      this.vals = data.values
      this.update(data.values)
    })

    this.socket.on('VALUES', (data) => {
        this.vals = data.values
        this.update(data.values)
    })

    this.socket.on('SET_ROTATION', (data) => {
        this.rotate(data)
    })
  },
  methods: {
    update(data) {
      data.forEach((c) => {
        this.widget.setAttribute(c.name, c.value)
      })
    },
    rotate(values) {
      this.widget.setAttribute('rotatex', values.x)
      this.widget.setAttribute('rotatey', values.y)
    }
  }
}
</script>

<style scoped>
.widget {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
}
</style>
