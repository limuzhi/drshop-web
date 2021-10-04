import store from '@/store'

function checkPermisaction(el, binding) {
    const { value } = binding
    const all_permission = '*:*:*'
    const permissions = store.getters && store.getters.permisaction
  
    if (value && value instanceof Array) {
      if (value.length > 0) {
        const permissionFlag = value
  
        const hasPermission = permissions.some(permission => {
          return all_permission === permission || permissionFlag.includes(permission)
        })
  
        if (!hasPermission) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      }
    } else {
      throw new Error(`need permission! Like v-permission="['admin','editor']"`)
    }
  }
  
  export default {
    inserted(el, binding) {
      checkPermisaction(el, binding) 
    },
    update(el, binding) {
      checkPermisaction(el, binding)
    }
  }
  