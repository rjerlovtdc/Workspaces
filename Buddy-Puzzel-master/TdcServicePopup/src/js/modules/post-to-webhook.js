const postToWebhook = async (receiverUrl, postData) => {

  console.log(postData)

  let bodyData = {
    postData
  }

  const response = await fetch(`${receiverUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyData)
  })
  .catch((error) => {
    console.log(error)
  })

  return response.json()
}

export {postToWebhook}