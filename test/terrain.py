import os
import urllib2
from lettuce import before, after, world, step
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import lettuce_webdriver.webdriver
from lettuce_webdriver.util import find_field_by_name
from nose.tools import assert_equals

from util import TestEndpoint

@before.all
def setup_browser():
    # Start the SPARQL testing endpoint
    world.test_endpoint = TestEndpoint()
    world.test_endpoint.start()

    world.endpoint = 'http://%s:%d/sparql' % (world.test_endpoint.host,
                                              world.test_endpoint.port)

    # Try connecting to the endpoint
    try:
        urllib2.urlopen(world.endpoint + "?query=SELECT+%3Fs+%3Fp+%3Fo+WHERE+%7B+%3Fs+%3Fp+%3Fo+%7D+LIMIT+1").read()
    except:
        _stop_test_endpoint()
        raise

    # Start the browser and load deniz
    world.browser = webdriver.Firefox()
    world.file_path = 'file://' + os.path.abspath(os.path.join('deniz.html'))

    # Set the endpoint cookie so we test against the local server
    world.browser.get(world.file_path)
    _set_endpoint(world.endpoint)
    world.browser.refresh()

    try:
        assert_equals(world.endpoint, _get_endpoint())
    except:
        _stop_test_endpoint()
        raise

def _stop_test_endpoint():
    world.test_endpoint.stop()

@after.all
def stop_endpoint(total):
    _stop_test_endpoint()

@after.all
def close_browser(total):
    world.browser.quit()

def _set_endpoint(value):
    # Get the span that triggers the form visibility
    elem = world.browser.find_element_by_xpath('//*[@id="endpointoption"]/span[@class="optionvalue"]')

    # Find endpoint field
    # Cannot use short cut functions as they test on visibility
    #text_field = find_field_by_name(world.browser, 'text', "endpoint")
    #text_field.clear()
    text_field = world.browser.find_element_by_xpath('//input[@name="endpoint"]')

    # Clear the field that has the focus once we click the span
    elem.click()
    text_field.send_keys(''.join(Keys.BACK_SPACE for _ in range(30)))

    text_field.send_keys(value + Keys.RETURN)

def _get_endpoint():
    cookie = world.browser.get_cookie('deniz_endpoint')
    if cookie and cookie.get('value'):
        return urllib2.unquote(cookie['value'])

@step('I open deniz')
def visit(step):
    world.browser.get(world.file_path)

@step('I set the endpoint to "(.*?)"')
def set_endpoint(step, value):
    _set_endpoint(value)
