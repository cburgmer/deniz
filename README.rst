Deniz is a simple RDF browser written in Javascript.

You can use any SPARQL protocol (http://www.w3.org/TR/rdf-sparql-protocol/) compatible SPARQL service as back-end.

Example
=======
See http://cburgmer.github.com/deniz.

Testing
=======
Testing is build on Python, Selenium and Lettuce

To run unit tests install:
  * Python (>= 2.6, < 3.0)
  * lettuce_webdriver, http://pypi.python.org/pypi/lettuce_webdriver
  * nose, http://pypi.python.org/pypi/nose
  * sparqlprotocolproxy, http://github.com/cburgmer/sparqlprotocolproxy
  * surf.rdflib, http://pypi.python.org/pypi/surf.rdflib

Installing using pip (& easy_install)
-------------------------------------
Run::

    $ pip install lettuce_webdriver nose
    $ pip install -e git://github.com/cburgmer/sparqlprotocolproxy.git
    $ easy_install surf.rdflib # currently not installable by pip

Running the tests
-----------------
Simply::

    $ lettuce test/

Contact
=======
Please report bugs to http://github.com/cburgmer/deniz/issues.

Christoph Burgmer <cburgmer (at) ira uka de>
