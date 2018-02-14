const format = val => JSON.stringify(val, null, 2);

const log = (title, msg) => {
  console.log('\n');
  console.log(title);
  console.log(msg);
  console.log('_'.repeat(50));
}

const isExists = val => typeof val !== 'undefined';

const flat = values => values.reduce((acc, cur) => {
    const needMore = [].concat(cur).some(Array.isArray);
    return acc.concat(needMore ? flat(cur) : cur);
  }, []);

const computeAllBits = values => values.reduce((acc, cur) => acc + cur.bits, 0);

const createAlphabet = str => {
  const alphabet = {};

  str
    .split('')
    .forEach(s => isExists(alphabet[s]) ? alphabet[s]++ : alphabet[s] = 1);

  return Object.keys(alphabet)
    .map(symbol => ({ symbol, occurences: alphabet[symbol]}))
    .sort((a, b) => b.occurences - a.occurences);
}

const createTree = (values, pref = '') => {
  if (values.length < 2) {
    return values;
  }

  const sum = values.reduce((acc, current) => acc + current.occurences, 0);

  const porog = Math.ceil(sum / 2);
  let counter = 0;
  let tree = [
    {
      prefix: pref + '0',
      values: []
    },
    {
      prefix: pref + '1',
      values: []
    }
  ];

  values.forEach((el, index) => {
    counter += el.occurences;
    const prefix = +(index && counter >= porog);
    tree[prefix].values.push(el);
  })

  tree = tree.map(el => ({
    prefix: el.prefix,
    values: createTree(el.values, el.prefix)
  }));

  return tree;
}

const getValues = (values, prefix = '') => values.length < 2 ?
    ({
      key: values[0].symbol,
      code: prefix,
      bits: values[0].occurences * prefix.length
    }) :
    values.map(v => getValues(v.values, v.prefix));



const encode = (message = '') => {
  if(!message.length) return '';

  const alphabet = createAlphabet(message);

  if(message.length === 1) {
    return {
      message: '0',
      bits: 1,
      dictionary: { [message] : '0'},
      decodeDictionary: { '0': message }
    };
  }

  const values = flat(getValues(createTree(alphabet)));

  const dictionary = {};
  const decodeDictionary = {};
  values.forEach(({ key, code }) => {
    dictionary[key] = code;
    decodeDictionary[code] = key;
  });

  const encodedMessage = message
    .split('')
    .map(s => dictionary[s])
    .join('');

  return {
    message: encodedMessage,
    bits: computeAllBits(values),
    dictionary,
    decodeDictionary,
  };
};

const decode = (message, dictionary) => {
  let decoded = '';

  let prefix = '';
  let symbol;

  for(let i = 0; i < message.length; i++) {
    prefix += message[i];
    symbol = dictionary[prefix];

    if (isExists(symbol)) {
      decoded += symbol;
      prefix = '';
    }
  }

  return decoded;
}

// const msg = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
// const msg = 'а роза упала на лапу азора';
const msg = 'арозаупаланалапуазора';
const encoded = encode(msg);
log('encoded', encoded.message);
log('amount of bits', encoded.bits);
log('dictionary', format(encoded.dictionary));
log('decoded', decode(encoded.message, encoded.decodeDictionary));
