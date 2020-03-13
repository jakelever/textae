#!/bin/bash
set -ex

bioconcepts2pubtatorcentral=../../pgxmine/data/bioconcepts2pubtatorcentral.gz

zcat $bioconcepts2pubtatorcentral |\
cut -f 2,4 -d $'\t' |\
tr '[:upper:]' '[:lower:]' |\
awk -F $'\t' ' { n=split($2,a,"|"); for (i in a) print $1"\t"a[i]; } ' |\
grep -F " " |\
awk ' { seen[$0]++ } END { for (d in seen) print seen[d]"\t"d; } ' > multiWordEntities.withCountsAndTypes.txt

cat multiWordEntities.withCountsAndTypes.txt |\
awk -F $'\t' ' { if ($1 >= 5) print $2"\t"$3 } ' > multiWordEntities.withCountsAndTypes.min5.txt

