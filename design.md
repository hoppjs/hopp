# process

  1) load up `hopp.lock`
  2) for each glob, walk through project and build list of changes files.
     glob should only contain what has changed
  3) when all globs are ready, use all non-empty results to mark tasks as stale
  4) distribute tasks pipeline across several gulp processes (don't even need to do this
  in a smart way, just fork some gulps).
  5) when a task ends, if it is successful, update markings on source files.
  6) when all tasks are done, quit with error if any fail, otherwise succeed.
