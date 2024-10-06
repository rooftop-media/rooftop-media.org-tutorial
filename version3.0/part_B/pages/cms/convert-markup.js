//  Convert-markup.js -- Functions to sanitize and convert markup to html

//  Tokens include <, /, =, ", ', >, -, !, whitespace, and text. 
function markup_to_tokens(markup) {
  let tokens = [];
  let tokenNames = {
    '<': 'LESS-THAN',
    '/': 'FORWARD-SLASH',
    '=': 'EQUALS',
    '"': 'DOUBLE-QUOTE',
    "'": 'SINGLE-QUOTE',
    '>': 'GREATER-THAN',
    '-': 'DASH',
    '!': 'EXCLAMATION'
  }
  let tokenKeys = Object.keys(tokenNames);
  let currentText = ''

  function addCurrentText() {
    if (currentText.length > 0) {
      tokens.push({ type: 'TEXT', value: currentText });
      currentText = '';
    }
  }
  
  for (let i = 0; i < markup.length; i++) {
    if (tokenKeys.includes(markup[i])) {
      addCurrentText();
      tokens.push({ type: tokenNames[markup[i]], value: markup[i] });
    } else {
      currentText += markup[i];
    }
  }
  addCurrentText();

  return tokens;
}
  
//  Uses context to create an array of "parsed tokens."
function tokens_to_parse(tokens) {
  let parsed_tokens = [];
  let context = 'text';
  let current_value = '';

  function addCurrentValue(_type) {  
    if (current_value.length > 0) {
      parsed_tokens.push({ type: _type, value: current_value });
      current_value = '';
    }
  }

  for (let i = 0; i < tokens.length; i++) {

    if (context == 'text') {                  ////  If we're looking at text, outside a tag, check only for "<"
      if (tokens[i].type == 'LESS-THAN') {
        context = 'start-of-tag';
        addCurrentValue('TEXT');
        parsed_tokens.push(tokens[i]);
      } else {
        current_value += tokens[i].value;
      }

    } else if (context == 'start-of-tag') {   ////  If we just saw a "<", check for text, /, or !.  Anything else is invalid.
      if (tokens[i].type == 'TEXT') {           
        let tag_name = tokens[i].value;
        let index_of_space = tokens[i].value.indexOf(' ');  //  If the tag name looks like "a href" only get text b4 the space. 
        if (index_of_space > 0) {
          tag_name = tokens[i].value.substring(0, index_of_space);
        }
        current_value += tag_name;

        let next_char_dash = (i < tokens.length - 1 && tokens[i+1].type == 'DASH'); //  True if the tag name is "tag-name" OR "p my-attr="
        if (!next_char_dash) {
          addCurrentValue('OPEN-TAG');
          context = 'in-a-tag';
        } 
        
        if (index_of_space > 0) {                         //  If the tag name looks like "a href", try the "href" again in new context.
          tokens[i].value = tokens[i].value.substring(tokens[i].value.indexOf(' '), tokens[i].value.length);
          i--;
        }
      } else if (tokens[i].type == 'DASH') {              //  Needed to support <dashed-tags>
        current_value += tokens[i].value;
        let next_char_text = (i < tokens.length - 1 && tokens[i+1].type == 'TEXT'); //  True if the tag name is <tag-name
        if (!next_char_text || (i < tokens.length - 1 && tokens[i+1].value.indexOf(' ') == 0)) {
          addCurrentValue('INVALID');
          context = 'invalid';
        }
      } else if (tokens[i].type == 'FORWARD-SLASH') {
        context = 'start-of-close-tag';
        parsed_tokens.push(tokens[i]);
      } else if (tokens[i].type == 'EXCLAMATION') {
        context = 'start-of-comment';
        parsed_tokens.push(tokens[i]);
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'in-a-tag') {     ////  If in a tag, look for text (attr-name), a /, or a >. Anything else is invalid
      if (tokens[i].type == 'TEXT') {
        context = 'attribute-equals';
        let attr_name = tokens[i].value;
        let index_of_space = tokens[i].value.indexOf(' ');  //  If the attr name looks like "checked class" only get text b4 the space. 
        if (index_of_space > 0) {                           //  Note:  If the space is at index 0, like " class", ignore it.
          attr_name = tokens[i].value.substring(0, index_of_space);
        }
        parsed_tokens.push({ type: 'ATTR-NAME', value: attr_name });
        if (index_of_space > 0) {                         //  If the tag name looks like "checked class", try the "class" again.
          tokens[i].value = tokens[i].value.substring(tokens[i].value.indexOf(' '), tokens[i].value.length);
          i--;
          context = 'in-a-tag';
        }
      } else if (tokens[i].type == 'FORWARD-SLASH') {       //  As in, <br/>
        context = 'end-of-single-tag';
        parsed_tokens.push(tokens[i]);
      } else if (tokens[i].type == 'GREATER-THAN') {
        context = 'text';
        parsed_tokens.push(tokens[i]);
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'attribute-equals') {    ////  If we just saw an ATTR-NAME, expect = or /. (or a space, but that's handled in 'in-a-tag')
      if (tokens[i].type == 'EQUALS') {
        parsed_tokens.push(tokens[i]);
        context = 'start-of-attribute';
      } else if (tokens[i].type == 'FORWARD-SLASH') {
        parsed_tokens.push(tokens[i]);
        context = 'end-of-single-tag';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'start-of-attribute') {  ////  If we just saw something like "class=", expect either ' or ".  Anything else is invalid.
      if (tokens[i].type == 'SINGLE-QUOTE') {
        parsed_tokens.push(tokens[i]);
        context = 'single-quote-attr-value';
      } else if (tokens[i].type == 'DOUBLE-QUOTE') {
        parsed_tokens.push(tokens[i]);
        context = 'double-quote-attr-value';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'single-quote-attr-value') {   ////  If we just saw a single quote, expect text, /, ", = or a closing '. 
      if (['TEXT', 'FORWARD-SLASH', 'DOUBLE-QUOTE', 'EQUALS', 'DASH', 'EXCLAMATION'].includes(tokens[i].type)) {
        current_value += tokens[i].value;
      } else if (tokens[i].type == 'SINGLE-QUOTE') {
        addCurrentValue('ATTR-VALUE');
        parsed_tokens.push(tokens[i]);
        context = 'in-a-tag';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'double-quote-attr-value') {   ////  If we just saw a double quote, expect text, /, ', = or a closing ". 
      if (['TEXT', 'FORWARD-SLASH', 'SINGLE-QUOTE', 'EQUALS', 'DASH', 'EXCLAMATION'].includes(tokens[i].type)) {
        current_value += tokens[i].value;
      } else if (tokens[i].type == 'DOUBLE-QUOTE') {
        addCurrentValue('ATTR-VALUE');
        parsed_tokens.push(tokens[i]);
        context = 'in-a-tag';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }
  
    } else if (context == 'end-of-single-tag') {    ////  If we just saw a / inside a tag, after the tag name, expect >.  Anything else is invalid
      if (tokens[i].type == 'GREATER-THAN') {               //  Examples:  <br/>   or <img src="cat.png" />
        parsed_tokens.push(tokens[i]);
        context = 'text';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'start-of-close-tag') {  ////  If we just saw </ , expect text (the close tag name)
      if (tokens[i].type == 'TEXT') { 
        parsed_tokens.push({ type: 'CLOSE-TAG', value: tokens[i].value });
        context = 'in-a-close-tag';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }
      
    } else if (context == 'in-a-close-tag') {      ////  If we just saw a close tag name, expect >
      if (tokens[i].type == 'GREATER-THAN') {  
        parsed_tokens.push(tokens[i]);
        context = 'text';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }
      
    } else if (context == 'start-of-comment') {    ////  If we just saw <!, expect two dashes.
      if (tokens[i].type == 'DASH' && i < tokens.length - 1 && tokens[i+1].type == 'DASH') {  
        parsed_tokens.push(tokens[i]);
        parsed_tokens.push(tokens[i]);
        i++;
        context = 'in-a-comment';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }
    } else if (context == 'in-a-comment') {    ////  If we just saw <!, expect two dashes.
      if (tokens[i].type == 'DASH' && i < tokens.length - 2 && tokens[i+1].type == 'DASH' && tokens[i+2].type == 'GREATER-THAN') {  
        addCurrentValue('COMMENT');
        parsed_tokens.push(tokens[i]);
        parsed_tokens.push(tokens[i]);
        i += 2;
        parsed_tokens.push(tokens[i]);
        context = 'text';
      } else {
        current_value += tokens[i].value;
      }
    } else if (context == 'invalid') {
      current_value += tokens[i].value;
    }
  }

  addCurrentValue('TEXT');
  return parsed_tokens;
}

//  Accepts an array of parsed tokens, returns an array of parsed tokens, with <pre> and <code> text escaped and labelled
function parse_code_tags(tokens) {
  let parsed_tokens = [];
  let context = 'non-code-tag';
  let current_value = '';

  function addCurrentValue(_type) {  
    if (current_value.length > 0) {
      parsed_tokens.push({ type: _type, value: current_value });
      current_value = '';
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    if (context == 'non-code-tag') {      //  If we haven't yet seen a 'pre' or 'code' tag, look for those tags. 
      if (tokens[i].type == 'OPEN-TAG' && tokens[i].value == 'code') {
        context = 'in-code-tag';
      }
      parsed_tokens.push(tokens[i]);
    
    } else if (context == 'in-code-tag') {         //  If in a code tag, look for a >
      if (tokens[i].type == 'GREATER-THAN') {
        context = 'in-code-tag-text';
      }
      parsed_tokens.push(tokens[i]);
    
    } else if (context == 'in-code-tag-text') {    //  If in the inner HTML of a code tag, look for <
      if (tokens[i].type == 'CLOSE-TAG' && tokens[i].value == 'code') {
        context = 'non-code-tag';
        current_value = current_value.slice(0, current_value.length - 2);
        addCurrentValue('CODE-TAG-TEXT');
        parsed_tokens.push({type: 'LESS-THAN', value: '<'});
        parsed_tokens.push({type: 'FORWARD-SLASH', value: '/'});
        parsed_tokens.push(tokens[i]);
      } else {
        current_value += tokens[i].value;
      }

    } 
  }
  return parsed_tokens;
}


//  Accepts an array of parsed tokens, returns a "simplified" list of tag tokens
function parse_to_tags(parsed_tokens) {
  let simple_tags = ['TEXT', 'OPEN-TAG', 'ATTR-NAME', 'ATTR-VALUE', 'CLOSE-TAG', 'CODE-TAG-TEXT', 'INVALID'];
  let tag_tokens = [];
  for (let i = 0; i < parsed_tokens.length; i++) {
    if (simple_tags.includes(parsed_tokens[i].type)) {
      tag_tokens.push(parsed_tokens[i]);
    }
  }
  return tag_tokens;
}

//  This converts the simplified tags into validated simplified tags!
function tags_to_valid_tags(tag_tokens) {
  let allowed_tags = [
    'h1','h2','h3','h4','h5','h6','p','div','span','b','i','pre','code','style',
    'ol','ul','li','table','tr','th','td','a','img','br','hr'
  ];
  let allowed_attributes = ['style','src','alt','href','target','class','id'];
  let delete_tag = false;   //  Flag to start skipping attributes, once invalid open tag is found
  let valid_tags = [];
  for (let i = 0; i < tag_tokens.length; i++) {
    if (tag_tokens[i].type == 'OPEN-TAG' && !allowed_tags.includes(tag_tokens[i].value)) {
      delete_tag = true;    //  Skip any tags, and any subsequentattr's belonging to tags, not included in the allowed tags. 
    } else if (['TEXT', 'CLOSE-TAG', 'OPEN-TAG', 'CODE-TAG-TEXT'].includes(tag_tokens[i].type)) {
      delete_tag = false;   // Stop skipping tags (set to false) if we're at a TEXT or CLOSE-TAG, or a new OPEN-TAG that's allowed
    }
    if (delete_tag) {
      continue;
    }
    if (tag_tokens[i].type == 'CLOSE-TAG' && !allowed_tags.includes(tag_tokens[i].value)) {
      continue;
    }
    if (tag_tokens[i].type == 'ATTR-NAME' && !allowed_attributes.includes(tag_tokens[i].value.trim())) {
      if (tag_tokens[i+1].type == 'ATTR-VALUE') {
        i++;
      }
      continue;
    }
    valid_tags.push(tag_tokens[i]);
  }
  return valid_tags;
}

//  Takes an array of simplified tag tokens, returns a string of HTML
function tags_to_html(tag_tokens) {
  let final_html = '';
  for (let i = 0; i < tag_tokens.length; i++) {
    let _type = tag_tokens[i].type;
    let _value = tag_tokens[i].value;
    if (i != 0 && ['OPEN-TAG', 'CLOSE-TAG', 'TEXT', 'CODE-TAG-TEXT'].includes(tag_tokens[i].type) && ['OPEN-TAG', 'ATTR-NAME', 'ATTR-VALUE'].includes(tag_tokens[i-1].type)) {
      final_html += '>';
    }
    if (_type == 'OPEN-TAG') {
      final_html += `<` + _value;
    } else if (_type == 'ATTR-NAME') {
      final_html += _value + `='`;
    } else if (_type == 'ATTR-VALUE') {
      final_html += _value + `'`;
    } else if (_type == 'CLOSE-TAG') {
      final_html += '</' + _value + '>';
    } else if (_type == 'TEXT') {
      final_html += _value;
    } else if (_type == 'CODE-TAG-TEXT') {
      final_html += _value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");;
    }
  }
  return final_html;
}

//  Takes a string of HTML, converts it to tokens, validates, returns the final string
function validate_html(_html) {
  let _tokens = markup_to_tokens(_html)
  let _parsed = tokens_to_parse(_tokens);
  let _escaped_parse = parse_code_tags(_parsed)
  let _tags = parse_to_tags(_escaped_parse);
  let _valid_tags = tags_to_valid_tags(_tags);
  let final_html = tags_to_html(_valid_tags);
  return final_html;
}


//  This lets us use this file on both the web and server
if (typeof window === 'undefined') {
  module.exports = {
    markup_to_tokens,
    tokens_to_parse,
    parse_code_tags,
    parse_to_tags,
    tags_to_valid_tags,
    tags_to_html,
    validate_html
  }
}
