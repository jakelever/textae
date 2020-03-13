import argparse
import kindred
import re
import sys

def findNonContigious(doc,lookup,outF):
	MAX_WORDS = 4
	doc.text = doc.text.lower()
	for e in doc.entities:
		e.text = e.text.lower()

		startPos = e.position[0][0]
		prevText = doc.text[:startPos]
		if prevText.endswith(' and '):
			possibleItems = prevText[:-len(' and ')].split(',')
			possibleItems = [ item.strip() for item in possibleItems ]
			possibleItems = [ item for item in possibleItems if item ]
			#print(possibleItems)

			tooLongTerms = [ i for i,item in enumerate(possibleItems) if len(item.split()) > MAX_WORDS ]
			if tooLongTerms:
				possibleItems = possibleItems[tooLongTerms[-1]:]
				possibleItems[0] = " ".join(possibleItems[0].split()[-MAX_WORDS:])

			if not possibleItems:
				continue

			eWords = e.text.split()
			for i in range(len(eWords) - 1):
				#eWords[i+1:]
				
				for item in possibleItems:
					newTerm = " ".join(item.split() + eWords[i+1:])
					if newTerm in lookup and lookup[newTerm] == e.entityType.lower():
						#print(e.text, newTerm)
						outData = [ doc.metadata['pmid'], doc.metadata['section'], e.text, newTerm, e.position[0][0], e.position[0][1], e.entityType ]
						outF.write("\t".join(map(str,outData)) + "\n")

				fWords = possibleItems[0].split()
				for j in range(len(fWords)-1):
					newTerm = " ".join(fWords[-(j+1):] + eWords[i+1:])
					#print(newTerm)
					if newTerm in lookup and lookup[newTerm] == e.entityType.lower():
						#print("\t".join([newTerm, e.text]))
						outData = [ doc.metadata['pmid'], doc.metadata['section'], e.text, newTerm, e.position[0][0], e.position[0][1], e.entityType ]
						outF.write("\t".join(map(str,outData)) + "\n")
			
			#print(possibleItems)
			#break
		

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Search a text corpus looking for lists that could contain non-contigious entities as example usecases for TextAE new functionality')
	parser.add_argument('--biocxml',required=True,type=str,help='Text corpus in BioC XML format')
	parser.add_argument('--termsAndTypes',required=True,type=str,help='List of terms with types to look for')
	parser.add_argument('--outFile',required=True,type=str,help='Output file to save results to')
	args = parser.parse_args()

	with open(args.termsAndTypes) as f:
		lookup = {}
		for line in f:
			termType,term = line.strip('\n').split('\t')
			lookup[term.lower()] = termType.lower()
			
		#lookup = { line.split('\t')[1].strip().lower():line.split('\t')[0] for line in f }
	print("Loaded")

	with open(args.outFile,'w') as outF:
		docCount = 0
		for corpus in kindred.iterLoad('biocxml',args.biocxml):
			for doc in corpus.documents:
				findNonContigious(doc,lookup,outF)

				docCount += 1
				#if (docCount % 1000) == 0:
				#	print("docCount=%d" % docCount)
				#	sys.stdout.flush()
			#break
				#for match in re.finditer('(\w+,\s*)*(\w)+ and \w+',doc.text):
				#	print(match.group())

