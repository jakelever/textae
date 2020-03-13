import argparse
import os
from collections import Counter

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Merge output of the findNonContiguous script across the literature and remove duplicates')
	parser.add_argument('--inDir',required=True,type=str,help='Input directory')
	parser.add_argument('--outFile',required=True,type=str,help='Output file')
	args = parser.parse_args()

	assert os.path.isdir(args.inDir)

	pmcFiles = sorted([ f for f in os.listdir(args.inDir) if f.endswith('.tsv') and f.startswith('PMC') ], reverse=True)
	pubmedFiles = sorted([ f for f in os.listdir(args.inDir) if f.endswith('.tsv') and f.startswith('PUBMED') ], reverse=True)

	filterTerms = {'disease disease', 'cancer disease', 'cancer cancer', 'diseases disease', 'cancer carcinoma'}

	pmidsInPrevFiles = set()
	with open(args.outFile,'w') as outF:
		for filename in pmcFiles + pubmedFiles:
			print("Processing %s" % filename)
			with open(os.path.join(args.inDir,filename)) as f:
				pmidsInThisFile = set()
				for line in f:
					split = line.strip('\n').split('\t')
					pmid = split[0]
					noncontig = split[3].lower()
					repeatWords = any( count>1 for count in Counter(noncontig.split()).values())
					
					if not pmid in pmidsInPrevFiles and not any (f in noncontig for f in filterTerms) and not repeatWords:
						outF.write(line)
						pmidsInThisFile.add(pmid)
				pmidsInPrevFiles.update(pmidsInThisFile)

