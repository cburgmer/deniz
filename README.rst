Deniz is a simple RDF browser written in Javascript.

You can use any SPARQL protocol (http://www.w3.org/TR/rdf-sparql-protocol/)
compatible SPARQL service as back-end.

Example
=======
See http://cburgmer.github.com/deniz.

Cross-Origin Resource Sharing (CORS)
====================================
As user agents are traditionally restricted by a Same Origin Policy, Deniz
makes use of CORS (http://www.w3.org/TR/cors/) when not served from the same
source as the SPARQL endpoint. The `dbpedia.org` service configured as default
supports CORS. If you want to use your own source make sure that your endpoint
does support it, too.

Using with Virtuoso
-------------------
OpenLink Virtuoso supports CORS but needs to be configured to take requests
across domains. See 
http://virtuoso.openlinksw.com/dataspace/dav/wiki/Main/VirtTipsAndTricksGuideCORSSetup
for a HOWTO. Use ``'*'`` when running Deniz from the local file system.

You can get the `"/sparql"` URL to support CORS by not creating a new setting
as explained there but by simply changing the configuration of the existing
entry.

Exposing to CORS with sparqlprocotolproxy
-----------------------------------------
A Python proxy server called `sparqlprocotolproxy` offers a proxy to a SPARQL
endpoint with CORS support. See https://github.com/cburgmer/sparqlprotocolproxy
for more information.

Testing
=======
Testing is built on Python, Selenium and Lettuce

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
