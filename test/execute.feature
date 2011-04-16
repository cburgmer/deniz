Feature: Executing queries

    Scenario: I get an empty result
        Given I open deniz
        And I press "Execute"
        Then I see no results

    Scenario: I see SPO results
        Given I have data
        And I open deniz
        And I press "Execute"
        Then I see SPO results
