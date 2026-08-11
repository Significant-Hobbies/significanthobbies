#!/bin/zsh

set -euo pipefail

script_dir="${0:A:h}"
project_root="${script_dir:h}"
destination="${SH_SIMULATOR_DESTINATION:-platform=iOS Simulator,id=38FDB30B-69F2-406E-A253-17183F2348BE}"
derived_data="${SH_DERIVED_DATA:-/private/tmp/significant-hobbies-ios-derived}"

cd "$project_root"
xcodegen generate
xcodebuild -project SignificantHobbies.xcodeproj -scheme SignificantHobbies -destination "$destination" -derivedDataPath "$derived_data" test
xcodebuild -project SignificantHobbies.xcodeproj -scheme SignificantHobbies -configuration Release -destination "$destination" -derivedDataPath "$derived_data" CODE_SIGNING_ALLOWED=NO build
