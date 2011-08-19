# -*- coding: utf-8 -*-
from lettuce import world, step
from nose.tools import assert_equals, assert_true

@step(u'Then I see no results')
def then_i_see_spo_results(step):
    cell = world.browser.find_element_by_xpath('//*[@id="query_results"]//table[@class="resulttable"]/tbody/tr/td[@colspan="3"]')
    assert_equals(cell.text, 'None')

@step(u'Then I see SPO results')
def then_i_see_spo_results(step):
    head = world.browser.find_element_by_xpath('//*[@id="query_results"]//table[@class="resulttable"]/thead')
    assert_equals(head.text, 's p o')
    # Make sure we find more than the "None" entry
    return world.browser.find_element_by_xpath('//*[@id="query_results"]//table[@class="resulttable"]/tbody[count(tr)>1]')
