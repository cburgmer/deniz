# -*- coding: utf-8 -*-
import re
import codecs

from lettuce import world, step, before, after
from lettuce_webdriver.util import find_field
from nose.tools import assert_true
from selenium import webdriver
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile


@before.all
def setup_slow_browser():
    # Start the browser
    profile = FirefoxProfile()
    # When inserting many lines of text the Javascript process takes ages
    profile.set_preference('dom.max_script_run_time', 10*60)
    profile.set_preference('dom.max_chrome_script_run_time', 10*60)
    world.slow_browser = webdriver.Firefox(firefox_profile=profile)

@after.all
def close_browser(total):
    world.slow_browser.quit()

@step(u'The static file "(.*)" validates correctly')
def the_page_validates_correctly(step, file_path):
    page_source = codecs.open(file_path, 'r', 'utf-8').read()

    # Fix doctype which Firefox & validator disagree upon
    page_source = re.sub(u"^<!DOCTYPE HTML ", u"<!DOCTYPE html ", page_source)

    # Post to validator
    world.slow_browser.get("http://validator.w3.org/#validate_by_input")
    field = find_field(world.slow_browser, 'textarea', 'fragment')
    field.clear()
    field.send_keys(page_source)
    field.submit()

    assert_true("Congratulations"
                in world.slow_browser.page_source)

@step(u'The page validates correctly')
def the_page_validates_correctly(step):
    page_source = world.browser.page_source

    # Fix doctype which Firefox & validator disagree upon
    page_source = re.sub(u"^<!DOCTYPE HTML ", u"<!DOCTYPE html ", page_source)

    # Post to validator
    world.slow_browser.get("http://validator.w3.org/#validate_by_input")
    field = find_field(world.slow_browser, 'textarea', 'fragment')
    field.clear()
    field.send_keys(page_source)
    field.submit()

    assert_true("Congratulations"
                in world.slow_browser.page_source)
