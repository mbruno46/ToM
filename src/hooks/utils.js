export function getParentByAttr(element, attr) {
  if (element.hasAttribute(attr)) {
    return element
  } else {
    return getParentByAttr(element.parentElement, attr)
  }
}

export default {
  getParentByAttr,
}