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
endpoint and supports CORS. See https://github.com/cburgmer/sparqlprotocolproxy
for more information.

What else
=========

Deniz includes a test suite. Check it out on http://travis-ci.org/#!/cburgmer/deniz. |travis_result|

.. |travis_result| image:: https://secure.travis-ci.org/cburgmer/deniz.png

Contact
=======
Please report bugs to http://github.com/cburgmer/deniz/issues.

Christoph Burgmer <cburgmer (at) ira uka de>
