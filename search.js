import rects from './script.js';

const onSearch = () => {
    let term = document.getElementById("term").value;
    // d.data.name.indexOf(term) != 0;
    rects.each(rect => {
      let index = rect.data.name.indexOf(term)
    })
  }
