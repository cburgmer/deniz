Feature: Opening the default page

    Scenario: I see the default view
        Given I open deniz
        Then I see "Deniz, an easy RDF browser"

    Scenario: The default select query should be shown
        Given I open deniz
        Then I see "SELECT ?s ?p ?o WHERE { ?s ?p ?o }"

    Scenario: I should be able to execute a query
        Given I open deniz
        Then I can click "Execute"

    Scenario: Default page can query default graph
        Given I open deniz
        Then I could query graph "Default graph"

    Scenario: Default page loads graphs
        Given I open deniz
        Then the store's graphs are loaded

    Scenario: Default page loads concepts
        Given I open deniz
        Then the store's concepts are loaded
