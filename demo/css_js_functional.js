const assignStyle = style => node =>
  Object.assign(node.style, style)

const totalDescendants = (total, child) => 
  child.children.length
    ? [...child.children].reduce(totalDescendants, [...total, ...child.children])
    : total

// Array.from(document.querySelectorAll('.🤓'))
const experiments = [...document.querySelectorAll('.🤓')]

// .🤓
experiments
  .forEach(({style}) => 
    Object.assign(style, {
      backgroundColor: 'hsl(200  100% 90%)',
      color: 'hsl(200 82% 15%)',
    }))


// .🤓 > h2
experiments
  .flatMap(child => [...child.children])
  .filter(child => child.nodeName === 'H2')
  .forEach(assignStyle({
    margin: 0,
  }))


// .🤓 > p:not(:first-of-type):not(:last-of-type)
experiments
  .flatMap(experiment => [...experiment.children])
  .filter(child => child.nodeName === 'P')
  .map(node => {
    const {0:first, length:l, [l - 1]:last} = 
      [...node.parentElement.children]
      .filter(child => child.nodeName === 'P')

    return {node, first, last}
  })
  .filter(({node, first, last}) => 
    node !== first && node !== last)
  .map(({node}) => node)
  .forEach(({style}) => 
    Object.assign(style, {
      textDecoration: 'underline',
      textDecorationColor: 'hsl(200 82% 45%)',
    }))


// .🤓 > p:last-child 
experiments
  .flatMap(experiment => [...experiment.children])
  .filter(child => child.nodeName === 'P')
  .filter(child => !child.nextElementSibling)
  .forEach(({style}) => 
    Object.assign(style, {
      textTransform: 'uppercase',
    }))


// .🤓 div
// .🤓 ... div
// .🤓 ... ... div
experiments
  .reduce(totalDescendants, [])
  .filter(child => child.nodeName === 'DIV')
  .forEach(assignStyle({
    paddingLeft: '1rem',
    fontSize: '.75em',
  }))