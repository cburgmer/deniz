#!/usr/bin/python

# Short script to embed external CSS and Javascript files with the main HTML
# document.
# 
# The goal is to provide only a single file, be it for easy portability or
# download speed.
#
# A proper solution would need to fully parse CSS and JS as to exclude invalid
# entities in the outer HTML context.
#
# TODO:
# - This script requires the HTML file to be valid XHTML, laxer parsing could be
#   possibly integrated.
# - Include images base64 encoded.

import sys
import codecs
from urllib2 import urlparse
from lxml import etree

def is_url_local(url):
    """ Returns true if URL is a local path. """
    r = urlparse.urlparse(url)
    return not (r.scheme or r.netloc)

def replace(handle):
    """
    Replaces links to external CSS and JS by embedding the content directly
    into the document.
    """
    # Preserve CDATA as we need to write it back again. 
    # As we uglify anways, just remove blanks, too.
    dom = etree.parse(handle, parser=etree.XMLParser(strip_cdata=False,
                                                     remove_blank_text=True))
    
    # Insert style sheets
    link_list = dom.xpath('//x:link[@type="text/css"]', 
                          namespaces={'x': "http://www.w3.org/1999/xhtml"})
    for link in link_list:
        href = link.attrib['href']
        if not is_url_local(href):
            # We only include local code
            continue

        # Load CSS
        link_handle = codecs.open(href, 'r', 'utf8')
        
        # Build a script element and embed CSS there
        style_element = etree.Element('style',
                                      attrib={'type': link.attrib['type']})

        style_element.text = etree.CDATA(link_handle.read())
        link.getparent().replace(link, style_element)

    # Insert JS code
    script_list = dom.xpath('//x:script[@type="text/javascript"]', 
                            namespaces={'x': "http://www.w3.org/1999/xhtml"})
    for script in script_list:
        # We only want to include external references
        if 'src' not in script.attrib:
            continue

        src = script.attrib['src']
        if not is_url_local(src):
            # We only include local code
            continue

        # Load JS code
        script_handle = codecs.open(src, 'r', 'utf8')
        
        # Build a script element and embed CSS there
        script_element = etree.Element('script',
                                       attrib={'type': script.attrib['type']})
                                       
        content = script_handle.read()
        # HACK, workaround "</script>" string in JS code prematurely closing
        #   script tag in HTML
        # This is far from beeing safe!!!
        content = (content.replace('</script>"', '</scr" + "ipt>"')
                          .replace("</script>'", "</scr' + 'ipt>'"))
        script_element.text = etree.CDATA(content)

        script.getparent().replace(script, script_element)

    # To string, encode as utf8
    html_str = etree.tostring(dom, 
                              xml_declaration=True, encoding='utf8')
    # Comment out CDATA, as HTML parsers will not understand this section
    # HACK while strip_cdata will preserve existing comments around CDATA
    #   sections, lxml doesn't seem to support the wrapping of CDATA with other
    #   text
    # Enquote by multi-line comment to work for both CSS & Javascript. Also, 
    #   following multi-line comments will be correctly parsed.
    # This is far from beeing safe!!!
    html_str = (html_str.replace('<![CDATA[', '/*<![CDATA[*/')
                        .replace(']]>', '/*]]>*/'))
    return html_str


def main():
    f = codecs.open(sys.argv[1], 'r', 'utf8')
    
    print replace(f)

if __name__ == "__main__":
    main()
