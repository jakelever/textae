import kindred

simpletag = "TP53 is a tumor suppressor in HER2+ breast, non-small cell lung and <cancer>metastatic ovarian cancers</cancer>"
corpus = kindred.Corpus(simpletag,loadFromSimpleTag=True)

kindred.save(corpus,'biocxml','test.bioc.xml')
