//  This script has functions to do server side rendering. 

//  Importing our custom libraries
const DataBase = require('../database/database.js');
const Convert = require('../../pages/cms/convert-markup.js');

//  Takes an array of tags and an object of props, returns tags w {{ x }} -> "hi"
function insert_props(tags, props) {
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].type == 'TEXT') {
      let context = 'text';
      let text = tags[i].value;
      let bracket_start = 0;
      let bracket_contents = '';
      for (let j = 0; j < text.length; j++) {
        if (context == 'text' && text.charAt(j) == '{' && text.charAt(j+1) == '{') {
          bracket_start = j;
          context = 'in-brackets';
          j++;
        } else if (context == 'in-brackets' && text.charAt(j) != '}') {
          bracket_contents += text.charAt(j);
        } else if (context == 'in-brackets' && text.charAt(j) == '}' && text.charAt(j+1) == '}') {
          j++;
          let new_text = text.slice(0, bracket_start);
          if (props[bracket_contents.trim()]) {
            new_text += props[bracket_contents.trim()];
          }
          new_text += text.slice(j+1, text.length);
          text = new_text;
          context = 'text';
        } 
      }
      tags[i].value = text;
    }
  }
  return tags;
}

//  Take an HTML string w/ components, returns an html string
function render_components(html) {
  let _tokens = Convert.markup_to_tokens(html);
  let _parsed = Convert.tokens_to_parse(_tokens);
  let _escaped_parse = Convert.parse_code_tags(_parsed);
  let _tags = Convert.parse_to_tags(_escaped_parse);
  //  Find + replace components
  let allowed_tags = [
    'h1','h2','h3','h4','h5','h6','p','div','span','b','i','pre','code','style',
    'ol','ul','li','table','tr','th','td','a','img','br','hr'
  ];
  let _component = {
    tag_name: '',
    attrs: {},
    props: {},
    text: ''
  }
  let _attr_name = '';
  let _prop_name = '';
  let _replace_start_pt;
  for (let i = 0; i < _tags.length; i++) {
    if ( !_component.tag_name && _tags[i].type == 'OPEN-TAG' && !allowed_tags.includes(_tags[i].value)) {
      _component.tag_name = _tags[i].value; // This marks that we're interpreting a component
      _replace_start_pt = i;
    } else if (_component.tag_name && _tags[i].type == 'ATTR-NAME') {
      if (_tags[i].value.trim().charAt(0) == ':') {
        _prop_name = _tags[i].value.trim().substring(1, _tags[i].value.length);
      } else {
        _attr_name = _tags[i].value;
      }
    } else if (_component.tag_name && _tags[i].type == 'ATTR-VALUE') {
      if (!_prop_name) {
        _component.attrs[_attr_name] = _tags[i].value;
      } else {
        _component.props[_prop_name] = _tags[i].value;
        _prop_name = '';
      }
    } else if (_component.tag_name && _tags[i].type == 'TEXT') {
      _component.text = _tags[i].value;
    } else if (_component.tag_name && _tags[i].type == 'CLOSE-TAG') {
      // now we have the component info... time to replace it.
      let found_components = DataBase.table('components').find({route: _component.tag_name} );
      if (found_components.length != 0) {
        let c_html = found_components[0].content;
        let c_tokens = Convert.markup_to_tokens(c_html);
        let c_parsed = Convert.tokens_to_parse(c_tokens);
        let c_escaped_parse = Convert.parse_code_tags(c_parsed);
        let c_tags = Convert.parse_to_tags(c_escaped_parse);  

        // Render props here TODO
        let c_tags_w_props = insert_props(c_tags, _component.props);

        //  Using the ... operator :)
        _tags.splice(_replace_start_pt, i-_replace_start_pt,...c_tags_w_props);
        i = _replace_start_pt;
        //
        
      } else {
        //  Error? Component not found
      }
      _component = {
        tag_name: '',
        attrs: {},
        props: {},
        text: ''
      }
    }

  } //  End loop through page tags

  //  let _valid_tags = tags_to_valid_tags(_tags);
  let final_html = Convert.tags_to_html(_tags);

  return final_html;
}

module.exports = {
  render_components
}