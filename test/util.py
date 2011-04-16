import logging
from threading import Thread
from BaseHTTPServer import HTTPServer
from SocketServer import ThreadingMixIn
from sparqlprotocolproxy import SPARQLHTTPProxy, SPARQLProtocolProxy

class TestEndpoint(Thread):
    def __init__(self, host='localhost', port=9980, *args, **kwargs):
        self.host = host
        self.port = port
        self.httpd = SPARQLHTTPProxy((self.host, self.port),
                                     SPARQLProtocolProxy,
                                     cors=True)

        logging.info("Starting up on %s:%d" % (self.host, self.port))

        Thread.__init__(self, *args, **kwargs)

    def run(self):
        self.httpd.serve_forever()

    def stop(self):
        self.httpd.shutdown()
