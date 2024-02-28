import { createApp} from 'vue'
import { addClass,removeClass } from '@/assets/js/dom'

const relativeCls = 'g-relative'

// createLoadingLikeDirective这个函数支持传入一个参数，这个参数就是对应组件
//传入一个loading组件就创造一个loading指令
//传入一个no-result组件就创造一个no-result指令
export default function createLoadingLikeDirective(Comp) {
  //返回一个对象
  return {
    //创建loading的时候再mounted中会做app的一个实例化
    mounted(el,binding) {
      const app = createApp(Comp)
      const instance = app.mount(document.createElement('div'))
      // 本来是el.instance = instance由于在music-list中作用指令的时候两个指令都作用在同一个元素scroll上
      //这时都绑在一个instance上就不太合适
      //因为同一个元素都会相继触发mounted，都会把创建的实例instance赋值给el.instance，
      // 后面的就会覆盖前面的，导致之后获取的el.instance就是后来的那个，前面的就丢掉了
      //comp不同即组件不同，组件不同组件name也不同
      const name = Comp.name
      if (!el[name]) {
        el[name] = {}
      }
      el[name].instance = instance
     
      const title = binding.arg
      if(typeof title !== 'undefined') {
        instance.setTitle(title)
      }
  
      //实例化后根据它的值看是否要添加进去append
      if(binding.value){
        append(el)
      }
    },
    updated(el,binding) {
      const title = binding.arg
      const name = Comp.name
      if(typeof title !== 'undefined') {
        el[name].instance.setTitle(title)
      }
      //updated时根据他的值添加或者移除
      if(binding.value !== binding.oldValue) {
        binding.value ? append(el) : remove(el)
      }
    }
  }

  function append(el) {
    const name = Comp.name
    const style = getComputedStyle(el)
    if(['absolute','fixed','relative'].indexOf(style.position) === -1) {
      addClass(el,relativeCls)
    }
    el.appendChild(el[name].instance.$el)
  }
  
  function remove(el) {
    const name = Comp.name
    removeClass(el,relativeCls)
    el.removeChild(el[name].instance.$el)
  }
}
