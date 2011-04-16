import logging
from threading import Thread
from BaseHTTPServer import HTTPServer
from SocketServer import ThreadingMixIn

from surf.store import Store
from sparqlprotocolproxy import SPARQLHTTPProxy, SPARQLProtocolProxy

class TestEndpoint(Thread):
    DEFAULT_STORE_SETTINGS = {'reader': "rdflib",
                              'writer': "rdflib",
                              'rdflib_store': 'IOMemory'}

    def __init__(self, host='localhost', port=9980, *args, **kwargs):
        self.host = host
        self.port = port
        self.store = Store(**TestEndpoint.DEFAULT_STORE_SETTINGS)
        self.httpd = SPARQLHTTPProxy((self.host, self.port),
                                     SPARQLProtocolProxy,
                                     store=self.store,
                                     cors=True)

        logging.info("Starting up on %s:%d" % (self.host, self.port))

        Thread.__init__(self, *args, **kwargs)

    def load_data(self, filename):
        rdf_graph = self.store.writer.graph
        rdf_graph.load(filename)

    def clear_data(self):
        self.store.writer.clear()

    def run(self):
        self.httpd.serve_forever()

    def stop(self):
        self.httpd.shutdown()
