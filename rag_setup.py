from llama_index import VectorStoreIndex, SimpleDirectoryReader, StorageContext

# Load docs from \docs (images 3-6 text)
documents = SimpleDirectoryReader('docs').load_data()
index = VectorStoreIndex.from_documents(documents)
index.storage_context.persist(persist_dir="./index_storage")  # Saves to \index_storage folder
print("RAG index created for offline ENDF/psychology queries.")