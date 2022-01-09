import { loadTextFile } from './utils.js';

const unit = 65781.76;
const tag = '(\\d+)'
const link = '(\\d),(\\d+)(?:,(\\d+))?'
const point = '(-?\\d+),(-?\\d+)'
const size = '(\\d+),(\\d+),(\\d+)'
const width = '(\\d+)'

var regex = {
  version: /SyncTeX Version:(.*)/,
  input: /Input:(\d+):(.+)/,
  output: /Output:(.+)/,
  unit: /Unit:(.+)/,
  magnification: /Magnification:(.+)/,
  offset_x : /X Offset:(\d+)/,
  offset_y : /Y Offset:(\d+)/,
  page: {
    open: /{(\d+)/,
    close: /}(\d+)/,
  },
  blocks: {
    vbox: new RegExp(`\\[${link}:${point}:${size}`),
    hbox: new RegExp(`\\(${link}:${point}:${size}`),
    void_vbox: new RegExp(`v${link}:${point}:${size}`),
    void_hbox: new RegExp(`h${link}:${point}:${size}`),
    current: new RegExp(`x${link}:${point}`),
    kern: new RegExp(`k${link}:${point}:${width}`),
    glue: new RegExp(`g${link}:${point}`),
    math: new RegExp(`\\$${link}:${point}`),
    // rule: new RegExp(`r${link}:${point}`),
    ref: new RegExp(`f${tag}:${point}`)
  }
};

var block_closures = {
  'vbox': ']',
  'hbox': ')',
}

export function syncTex(path) {
  let f = loadTextFile(path);
  let pages = [];
  let header = {'offset': {}, 'input': []};
  let idx = 0;
  let tex = {file: 0, line: 0, set: false};

  function extract(regex) {
    let tmp = f[idx].match(regex);
    if (tmp) {
      if (tmp.length==2) {
        return tmp[1];
      } else {
        return tmp.slice(1);
      }
    } else {
      return null;
    }
  }


  function parseBlock() {
    let type = getBlockType();
    if (type=='unknown') {idx++; return {type: type};}

    let tmp = extract(regex.blocks[type]);
    idx++;

    let out = {
      'type': type,
      'input': parseInt(tmp[0]),
      'line': parseInt(tmp[1]),
      'column':  (tmp[2]) ? parseInt(tmp[2]) : 0,
      'left': parseInt(tmp[3]) / unit,
      'bottom': parseInt(tmp[4]) / unit,
    }

    if (tmp.length==5) {return out;}

    out['width'] = parseInt(tmp[5]) / unit;
    if (type=='kern') {return out;}

    out['height'] = parseInt(tmp[6]) / unit;
    out['depth'] = parseInt(tmp[7]);
    if (['void_hbox','void_vbox'].includes(type)) {return out;}

    out['blocks'] = [];
    while (f[idx].substring(0,1) != block_closures[type]) {
      out.blocks.push(parseBlock());
    }

    idx++;
    return out;
  }

  function getId(data, i) {
    let el;
    data.forEach(element => {
      if (parseInt(element.id) == i) {el = element;}
    });
    return el;
  }

  function getBlockType() {
    let t = f[idx].substring(0,1);
    if (t=='[') {return 'vbox'}
    else if (t=='(') {return 'hbox'}
    else if (t=='h') {return 'void_hbox'}
    else if (t=='v') {return 'void_vbox'}
    else if (t=='x') {return 'current'}
    else if (t=='k') {return 'kern'}
    else if (t=='g') {return 'glue'}
    else if (t=='$') {return 'math'}
    else if (t=='f') {return 'ref'}
    else {return 'unknown'}
  }

  while (idx<f.length) {
    ['version','magnification','output','unit'].forEach(key => {
      let e = extract(regex[key]);
      if (e) {header[key] = e;}
    });

    ['x','y'].forEach(key => {
      let e = extract(regex[`offset_${key}`])
      if (e) {header.offset[key] = parseInt(e);}
    });

    let e = extract(regex.input);
    if (e) {header.input.push({id: e[0], path: e[1]});}

    let page_id = extract(regex.page.open);
    idx++;

    if (page_id) {
      pages.push({
        id: page_id,
        block: parseBlock()
      });

      idx++;
      if (extract(regex.page.close) == page_id) {
        idx++;
      } else {
        console.log('Broken synctex file');
      }
    }
  }

  function getXY(block,x,y) {
    let in_block = 0;

    if ((x>=block.left) && (x<block.left+block.width)) {in_block++;}
    if ((y>=block.bottom) && (y<block.bottom+block.height)) {in_block++;}

    block.blocks.forEach(b => {
      if ((b.type=='vbox')||(b.type=='hbox')) {getXY(b, x, y);}
    });

    if ((in_block==2) && (!tex.set)) {
      tex.file = block.input;
      tex.line = block.line;
      tex.set = true;
    }
    return;
  }

  // console.log(header);
  // console.log(pages);
  return {
    header,
    pages,
    pdf2tex(page, x, y) {
      tex.set = false;
      let p = getId(pages, page);
      getXY(p.block, x ,y);

      let i = getId(header.input, tex.file);
      return {
        file: i.path, 
        line: tex.line
      }
    }
  }
}

export default {
  syncTex
}