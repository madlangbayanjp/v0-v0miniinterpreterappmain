// Quick test script for the bottom-up parser
const { tokenizeExpression } = require('./lib/tokenizer.ts');
const { parseExpressionBottomUp } = require('./lib/bottom-up-parser.ts');

async function test() {
  try {
    console.log('Testing: "2"');
    const tokens = tokenizeExpression("2");
    console.log('Tokens:', tokens);
    const result = parseExpressionBottomUp(tokens);
    console.log('Success!', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
